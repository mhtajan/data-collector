echo "Setting Up data-collector"
curl -o nssm.zip https://nssm.cc/release/nssm-2.24.zip
tar --extract --file=nssm.zip ./nssm-2.24/win64/
mv ./nssm-2.24/win64/nssm.exe ./
rm -r ./nssm-2.24
./nssm.exe install data-collector