{
  stdenv,
  cmake,
  ninja,
  pkg-config,
  webkitgtk_6_0,
  gtk4,
  doxygen,
  graphviz,
  fetchFromGitHub,
}:
stdenv.mkDerivation (finalAttrs: {
  pname = "webview";
  version = "0.12.0";
  src = fetchFromGitHub {
    owner = "webview";
    repo = "webview";
    rev = finalAttrs.version;
    hash = "sha256-pmqodl2fIlCNJTZz1U5spW4MpcoMhQt5WFh3+TRny3U=";
  };
  nativeBuildInputs = [
    ninja
    cmake
    pkg-config
    doxygen
    graphviz
  ];
  buildInputs = [
    webkitgtk_6_0
    gtk4
  ];
})
