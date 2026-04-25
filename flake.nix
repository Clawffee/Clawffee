{
  description = "Clawffee - A simple Twitch bot tool for streamers!";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    systems.url = "github:nix-systems/default";
  };
  outputs =
    {
      self,
      systems,
      nixpkgs,
      ...
    }:
    let
      eachSystem =
        fn:
        nixpkgs.lib.genAttrs (import systems) (
          system:
          fn {
            inherit system;
            pkgs = import nixpkgs {
              inherit system;
            };
          }
        );
      buildPackages =
        pkgs:
        pkgs.lib.makeScope pkgs.newScope (self: {
          webview = self.callPackage ./nix/webview.nix { };
          clawffee = self.callPackage ./nix/clawffee.nix { };
        });
    in
    {
      packages = eachSystem (
        { pkgs, ... }:
        rec {
          inherit (buildPackages pkgs) clawffee;
          default = clawffee;
        }
      );
      devShells = eachSystem (
        { system, pkgs, ... }:
        {
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
        }
      );

    };
}
