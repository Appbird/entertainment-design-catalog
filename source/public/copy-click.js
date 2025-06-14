// ファイルをfetchしてcodeブロックにセット
function set_codeblock(path, copy_id, code_id) {
	fetch(path)
	.then(res => res.text())
	.then(text => {
		document.getElementById(code_id).textContent = text;
	})
	.catch(e => {console.error(e)})

	// コピーボタン
	document.getElementById(copy_id).addEventListener('click', function() {
		const code = document.getElementById(code_id).textContent;
		navigator.clipboard.writeText(code);
		this.textContent = 'Copied!';
		setTimeout(() => { this.textContent = 'Copy'; }, 1500);
	});
}

set_codeblock("./prompts/extract_EDC.txt", "edc-prompt-copy", "edc-prompt-code")
set_codeblock("./prompts/cluster_name_generation.txt", "cluster-name-copy", "cluster-name-code")