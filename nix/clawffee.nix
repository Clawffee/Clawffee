{
  lib,
  stdenvNoCC,
  makeDesktopItem,
  copyDesktopItems,
  makeWrapper,
  webview,
  systemd,
  yad,
  libnotify,
  bash,
  bun,
  withWebview ? true,
}:
let
  fullSrc = ./..;
  packageJson = builtins.fromJSON (builtins.readFile (fullSrc + /package.json));
in
stdenvNoCC.mkDerivation (finalAttrs: {
  strictDeps = true;
  __structuredAttrs = true;

  pname = packageJson.name;
  version = packageJson.version;
  src = lib.cleanSourceWith {
    src = fullSrc;
    filter =
      path: type:
      builtins.all (fn: fn path type) [
        lib.cleanSourceFilter
        # remove these files/folders
        (
          path: type:
          !(builtins.any (prefix: lib.path.hasPrefix (fullSrc + prefix) (/. + path)) [
            /.github
            /.vscode
            /commands
            /config
            /node_modules
            /plugins
            /.gitattributes
            /.gitignore
            /.gitmodules
            /flake.lock
            /flake.nix
            /test.sh
          ])
        )
        # only allow the script to stay in the nix folder
        (
          path: type:
          lib.path.hasPrefix (fullSrc + /nix) (/. + path)
          -> lib.path.hasPrefix (/. + path) (fullSrc + /nix/clawfee.sh)
        )
      ];
  };

  desktopItems = [
    (makeDesktopItem {
      name = "clawffee";
      exec = "clawffee";
      icon = "clawffee";
      desktopName = "Clawffee";
      genericName = "Twitch Bot";
      comment = finalAttrs.meta.description;
      categories = [
        "Development"
        "Utility"
      ];
    })
  ];
  nativeBuildInputs = [
    copyDesktopItems
    makeWrapper
  ];
  buildInputs = [
    bash
  ];

  binPath = lib.makeBinPath [
    bun
    systemd
    yad
    libnotify
  ];

  passthru = {
    inherit (finalAttrs) src;
  };

  installPhase = ''
    runHook preInstall

    mkdir -p "$out"

    mkdir -p "$out/share/clawffee"
    cp -r "$src/." "$out/share/clawffee/"

    mkdir -p "$out/share/pixmaps"
    ln -s "$out/share/clawffee/assets/clawffee.png" "$out/share/pixmaps/clawffee.png"

    chmod +x "$out/share/clawffee/nix/clawfee.sh"
    patchShebangs --host "$out/share/clawffee/nix/clawfee.sh"
    substituteInPlace "$out/share/clawffee/nix/clawfee.sh" \
      --replace '@CLAWFFEE_LAUNCHER@' "$out/share/clawffee/index.js"

    makeWrapper ${
      lib.concatStringsSep " \\\n" (
        [
          "$out/share/clawffee/nix/clawfee.sh"
          "$out/bin/clawffee"
          "--inherit-argv0"
          "--prefix PATH ':' \"$binPath\""
          "--set CLAWFFEE_LAUNCHER \"$out/share/clawffee/index.js\""
        ]
        ++ lib.optional (withWebview) "--set-default WEBVIEW_PATH \"${webview}/lib/libwebview.so\""
      )
    }

    runHook postInstall
  '';

  meta = {
    description = "A simple Twitch bot tool for streamers!";
    longDescription = ''
      A simple Twitch bot tool for streamers!

      Note: The environment variable CLAWFFEE_PATH can be set to the folder where the commands and plugins of the bot are stored.
    '';
    homepage = "https://github.com/Clawffee/Clawffee";
    license = lib.licenses.bsd3;
    platforms = [
      "aarch64-linux"
      "x86_64-linux"
    ];
    mainProgram = "clawffee";
  };
})
