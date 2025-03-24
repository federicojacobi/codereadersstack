const vscode = require('vscode');

const bookmarkStack = [];

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const treeViewProvider = new BookmarkTreeView();

	let pushBookmark = vscode.commands.registerCommand('code-readers-stack.push', function () {
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            let file = editor.document.uri.toString();
            let line = editor.selection.active.line;
			console.log( {file, line});
            bookmarkStack.push({ file, line });
            treeViewProvider.refresh();
        }
    });

	let popBookmark = vscode.commands.registerCommand('code-readers-stack.pop', async function () {
        let bookmark = bookmarkStack.pop();
        treeViewProvider.refresh();
        if (bookmark) {
            let doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(bookmark.file));
            let editor = await vscode.window.showTextDocument(doc);
            let position = new vscode.Position(bookmark.line, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position));
        }
    });

	context.subscriptions.push(pushBookmark, popBookmark);
    vscode.window.registerTreeDataProvider('crs-outline', treeViewProvider);
}

// This method is called when your extension is deactivated
function deactivate() {}

class BookmarkTreeView {
	constructor() {
		this._onDidChangeTreeData = new vscode.EventEmitter();
    	this.onDidChangeTreeData = this._onDidChangeTreeData.event;
	}

	refresh() {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element) {
		return new vscode.TreeItem(element.label);
	}

	getChildren() {
		return bookmarkStack.map((b, index) => ({ label: `${index + 1}: ${b.file.split('/').pop()}:${b.line + 1}` }));
	};
}

module.exports = {
	activate,
	deactivate
}
