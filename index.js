const childProcess = require('child_process');
const os = require('os');
const path = require('path');
const { shell } = require('electron');
const { AutoLanguageClient } = require('atom-languageclient');
const { CompositeDisposable } = require('atom');

class NixLanguageClient extends AutoLanguageClient {

  getGrammarScopes() {
    return ['source.nix']
  }

  getLanguageName() {
    return 'Nix'
  }

  getServerName() {
    return 'hnix-lsp'
  }

  /*
   * `startServerProcess` will be called automatically for us by the
   * LSP client, and is where the server will be launched from.
   */
  startServerProcess(projectPath) {
    return this.spawnServer(projectPath)
  }

  /*
   * The core logic for starting the LSP server.
   */
  spawnServer(projectPath) {
    let args = [],
        nixPath = atom.config.get("ide-nix.path"),
        debug = atom.config.get("ide-nix.isDebug"),
        loggingPath = atom.config.get("ide-nix.loggingPath");

    if (debug) {
      args.push('--debug', '-l', loggingPath);
    }

    const processOptions = {};
    const lspServer = childProcess.spawn(nixPath, args, processOptions);
    lspServer.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    lspServer.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    lspServer.on('error', err => atom.notifications.addError('Unable to start the hnix-lsp', {
      dismissable: true,
      buttons: [
        {
          text: 'Setup hnix-lsp',
          onDidClick: () => shell.openExternal('https://github.com/domenkozar/hnix-lsp/blob/master/README.md')
        }, {
          text: 'Open Dev Tools',
          onDidClick: () => atom.openDevTools()
        }
      ],
      description: 'This can occur if you do not hnix-lsp on your path, or you have yet to install it.'
    }));
    return lspServer;
  }

  /*
   * Enable the LSP debugging found in Settings -> Core -> Debug LSP.
   */
  enableDebug(enabled) {
    atom
      .config
      .set('core.debugLSP', enabled);
  }
}

module.exports = new NixLanguageClient()
