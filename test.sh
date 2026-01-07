original_dir=$(pwd)
bun build index.js --compile --outfile clawffee
rm -r ../clawffee-test
mkdir ../clawffee-test
mv clawffee ../clawffee-test/
cd ../clawffee-test
./clawffee
cd "$original_dir"