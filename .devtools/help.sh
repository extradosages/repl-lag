#!/bin/bash
ROOT=$(git rev-parse --show-toplevel)

# This trims off a trailing `/` if it's present
ARG=$(echo $1 | sed 's/\/$//')
AS_DIR=$ROOT/.devtools/$ARG
AS_HELP=$AS_DIR.help
AS_SCRIPT=$AS_DIR.sh

if [[ -f $AS_SCRIPT ]]
then
    echo "\`$ARG\` can be invoked."
fi

if [[ -d $AS_DIR ]]
then
    # Get all directory children
    # Get path tails
    SUB_DIRS=$(\
        find $AS_DIR \
            -mindepth 1 \
            -maxdepth 1 \
            -type d \
        | sed -e 's/^.*\/\(.*\)$/\1/g' \
    )

    # Get all `.sh` file children
    # Get path tails
    # Remove `.sh` extension
    SUB_FILES=$(\
        find $AS_DIR \
            -mindepth 1 \
            -maxdepth 1 \
            -name "*.sh" \
            -type f \
        | sed -e 's/^.*\/\(.*\)$/\1/g' \
        | sed -e 's/^\(.*\)\.sh$/\1/g'
    )

    # Concatenate lists
    # Replace spaces with newlines
    # Sort
    # Get rid of duplicated lines
    # Get rid of empty lines
    # Prepend original command
    SUB_CMDS=$(
        echo "$SUB_DIRS $SUB_FILES" \
        | tr " " "\n" \
        | sort \
        | uniq \
        | sed '/^[[:space:]]*$/d' \
        | sed -e "s#^#$ARG/#g"
    )

    if [[ -z $SUB_CMDS ]]
    then
        echo "\`$ARG\` refers to a path in \`<repo>/.devtools\` which has no children."
    else
        echo "\`$ARG\` has sub-commands. Available sub-commands are:"
        echo $SUB_CMDS
    fi
fi

if [[ -s $AS_SCRIPT ]] || [[ -s $AS_DIR ]]
then
    if [[ -f $AS_HELP ]]
    then
        echo '---------------------------------------'
        echo "$(cat $AS_HELP)"
    fi
else
    echo "\`$ARG\` does nothing and has no sub-commands."
fi
