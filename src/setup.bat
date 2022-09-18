echo "Setting Up data-collector"

curl -o nssm.zip https://nssm.cc/release/nssm-2.24.zip
tar --extract --file=nssm.zip ./nssm-2.24/win64/
mv ./nssm-2.24/win64/nssm.exe ./
rm -r ./nssm-2.24
rm -r ./nssm.zip
SET dc_path=%~dp0
set CLIENT_ID=588c86a0-c120-4c47-9c00-99c113db00ca
set CLIENT_SECRET=R1y7B3APzL3dwuyru-WCUpqC0LYxLEFn_ODbmjrS-rk
nssm.exe install data-collector "%dc_path%\data-collector.exe"
net start data-collector
pause