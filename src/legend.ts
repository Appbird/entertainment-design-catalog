/**
 * LegendBundleのコンストラクタに渡すオプション
 * @template L - 凡例で使用されるラベルの型
 */
export interface LegendBundleOptions<L> {
    /**
     * ラベルをソートするための比較関数。
     * 指定されない場合は、JavaScriptのデフォルトのソート順が使用されます。
     */
    sortlabel?: (a: L, b: L) => number;

    /**
     * 色の割り当て方法をカスタマイズします。
     * これらは内部で `label2color` 関数を構築するために使用されます。
     * - `string[]` (カラーパレット): 指定された色が順番に割り当てられます。
     * - `Map<L, string>`: ラベルに対応する色を直接指定します。
     * - `(label: L, index: number) => string`: ラベルとインデックスから色を動的に生成する関数。
     */
    colors?: readonly string[] | Map<L, string> | ((label: L, index: number) => string);
}

/**
 * データから凡例情報を生成し、管理するためのクラスです。
 * 色の取得は `label2color` 関数を介して行います。
 * @template T - 元となるデータの型
 * @template L - 凡例で使用されるラベルの型 (例: string, number)
 */
export class LegendBundle<T, L> {
	/**
	 * 凡例の名前
	 */
	public readonly name: string;
    /**
     * ソート済みのユニークなラベルの配列
     */
    public readonly labels: readonly L[];

    /**
     * データからラベルを抽出する関数
     */
    public readonly data2label: (data: T) => L;

    /**
     * ラベルから対応する色を取得する関数。
     * このクラスの色の参照は、原則としてこの関数を介して行います。
     */
    public readonly label2color: (label: L) => string;

    /**
     * `label2color` の結果をキャッシュする内部Map
     * @private
     */
    private readonly colors: Map<L, string>;

    /**
     * LegendBundleのインスタンスを生成します。
	 * @param name - 凡例の名前
     * @param datas - ラベルを抽出するための元データ配列
     * @param data2label - データからラベルを抽出するための関数
     * @param options - (オプション) ソート関数や色の割り当て方法を指定するオブジェクト
     */
    constructor(
		name: string,
        datas: readonly T[],
        data2label: (data: T) => L,
        options?: LegendBundleOptions<L>
    ) {
		this.name = name;
        this.data2label = data2label;

        // 1. データからユニークなラベルを抽出し、ソートする
        const uniqueLabels = [...new Set(datas.map(d => this.data2label(d)))];
        this.labels = Object.freeze(
            options?.sortlabel ? uniqueLabels.sort(options.sortlabel) : uniqueLabels.sort()
        );

        // 2. optionsに基づいて色のキャッシュ(Map)を生成する
        this.colors = this.createColorMap(options);

        // 3. キャッシュされたMapから色を引く公開関数を定義する
        this.label2color = (label: L) => {
            // Mapに存在することが保証されているため non-null assertion (!) を使用
            return this.colors.get(label)!;
        };
    }

    /**
     * optionsとlabelsに基づいて、ラベルと色のMapを生成する内部メソッド
     * @param options
     * @returns 生成された色のMap
     */
    private createColorMap(options?: LegendBundleOptions<L>): Map<L, string> {
        const colorMap = new Map<L, string>();
        const customColors = options?.colors;

        // Case 1: 色生成関数が指定された場合
        if (typeof customColors === 'function') {
            this.labels.forEach((label, index) => {
                colorMap.set(label, customColors(label, index));
            });
            return colorMap;
        }

        // Case 2: ラベルと色のMapが指定された場合
        if (customColors instanceof Map) {
            this.labels.forEach(label => {
                const color = customColors.get(label);
                if (color === undefined) {
                    console.warn(`Color for label "${String(label)}" is not defined in the provided Map. A fallback color will be used.`);
                    colorMap.set(label, this.generateHslColorByHash(String(label)));
                } else {
                    colorMap.set(label, color);
                }
            });
            return colorMap;
        }

        // Case 3: カラーパレット(配列)が指定された場合
        if (Array.isArray(customColors) && customColors.length > 0) {
            this.labels.forEach((label, index) => {
                colorMap.set(label, customColors[index % customColors.length]);
            });
            return colorMap;
        }

        // Case 4: 色の指定がない、または空の配列が指定された場合 (デフォルト)
        const total = this.labels.length;
        this.labels.forEach((label, index) => {
            // ユーザー指定の計算式でHueを算出
            const hue = total > 0 ? (320 * index) / total : 0;
            const saturation = 80;
            const lightness = 50;
            const color = `hsl(${hue.toFixed(0)}, ${saturation}%, ${lightness}%)`;
            colorMap.set(label, color);
        });
        return colorMap;
    }
    
    /**
     * 文字列のハッシュ値に基づいて安定した色を生成します (フォールバック用)。
     * @param str - ラベルなどの文字列
     * @returns HSLカラーコード
     * @private
     */
    private generateHslColorByHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
            hash |= 0; // 32bit integer
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 50%, 60%)`;
    }

    /**
     * 指定されたラベルに対応する色を取得します。
     * (このメソッドは `label2color` のエイリアスです)
     * @param label - 色を取得したいラベル
     * @returns ラベルに対応する色。
     */
    public getLabelColor(label: L): string {
        return this.label2color(label);
    }

    /**
     * 指定されたデータに対応する色を取得します。
     * @param data - 色を取得したいデータ
     * @returns データに対応する色。
     */
    public getDataColor(data: T): string {
        const label = this.getLabel(data);
        return this.label2color(label);
    }

    /**
     * 指定されたデータに対応する色を取得します。
     * @param datas - 色を取得したいデータ
     * @returns データに対応する色。
     */
    public getDataColors(datas: T[]): string[] {
        return datas.map(d => this.getDataColor(d))
    }

    /**
     * 指定されたデータからラベルを取得します。
     * @param data - ラベルを取得したいデータ
     * @returns 抽出されたラベル
     */
    public getLabel(data: T): L {
        return this.data2label(data);
    }

    /**
     * ソート済みのすべてのラベルの配列を取得します。
     * @returns ソート済みのラベルの（読み取り専用）配列
     */
    public getAllLabels(): readonly L[] {
        return this.labels;
    }

    /**
     * ソート済みのすべてのラベルとそれに対応する色のペアの配列を取得します。
     * @returns ラベルと色のペアの配列 `{ label: L; color: string }[]`
     */
    public getAllLabelColors(): { label: L; color: string }[] {
        return this.labels.map(label => ({
            label,
            color: this.label2color(label),
        }));
    }
}