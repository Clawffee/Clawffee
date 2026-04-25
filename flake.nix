{
  description = "Clawffee - A simple Twitch bot tool for streamers!";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    nix-appimage = {
      url = "github:ralismark/nix-appimage";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.flake-utils.follows = "flake-utils";
    };
  };
  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }@inputs:
    let
      buildPackages =
        pkgs:
        pkgs.lib.makeScope pkgs.newScope (self: {
          webview = self.callPackage ./nix/webview.nix { };
          clawffee = self.callPackage ./nix/clawffee.nix { };
          clawffee-appimage = inputs.nix-appimage.bundlers.${pkgs.stdenv.system}.default (
            self.clawffee.override { withWebview = false; }
          );
        });
    in
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        packages = rec {
          inherit (buildPackages pkgs) clawffee clawffee-appimage;
          default = clawffee;
        };
        devShells = {
          default = pkgs.mkShell {
            packages =
              (with self.packages.${system}; [ clawffee ])
              ++ (with pkgs; [
                bun
                systemd
                yad
                libnotify
              ]);
            shellHook = ''
              export CLAWFFEE_PATH=$(pwd)
              echo "CLAWFFEE_PATH=$(pwd)"
            '';
          };
        };
      }
    )
    // {
      overlays = rec {
        clawffee = final: _prev: {
          inherit (buildPackages final) clawffee;
        };
        default = clawffee;
      };
    };
}
