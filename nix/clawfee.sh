#!/usr/bin/env bash -e

function path() {
    IFS=: read -r -d '' -a search_configuration < <(systemd-path --no-pager search-configuration)
    for config_dir in "${search_configuration[@]}"; do
        if [[ -d "${config_dir}/clawffee" ]]; then
            echo "${config_dir}/clawffee"
            return
        fi
    done
    # first time use
    user_configuration=$(systemd-path --no-pager user-configuration)
    echo "could not find clawffee config folder, assuming first launch. Creating directories..." >&2
    mkdir -p "${user_configuration}/clawffee"
    mkdir -p "${user_configuration}/clawffee/plugins"
    mkdir -p "${user_configuration}/clawffee/config"
    mkdir -p "${user_configuration}/clawffee/commands"
    echo "${user_configuration}/clawffee"
}

function launcher() {
    if [[ -f "./launch.js" ]]; then
        echo "$(realpath ./launch.js)"
    else
        echo "@CLAWFFEE_LAUNCHER@"
    fi
}

export CLAWFFEE_PATH="${CLAWFFEE_PATH:-$(path)}"
echo "CLAWFFEE_PATH=${CLAWFFEE_PATH}" >&2
cd "${CLAWFFEE_PATH}"

export CLAWFFEE_LAUNCHER="$(launcher)"
echo "CLAWFFEE_LAUNCHER=${CLAWFFEE_LAUNCHER}" >&2
exec -a "$0" bun "${CLAWFFEE_LAUNCHER}" -- "$@"
