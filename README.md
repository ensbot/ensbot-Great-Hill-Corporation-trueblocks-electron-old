### instructions


```
git clone https://github.com/Great-Hill-Corporation/trueblocks-electron
npm install


just run app
```
npm run dev & node src/electron-wait-react.js
```

optional: install mock json server (mocks json response)

```
cd test-server
npm install
cd ..
```


run mock json server and app
```
cd test-server && node index.js & cd .. && npm run dev & node src/electron-wait-react.js
```

Right now we are extra hacky and are hardcoding api urls. The places to change for running against dappnode are:
- Line 64 of src/App.js: change that to http://my.trueblocks.public.dappnode.eth/export?address=
- src/address-list.json -- controls the monitor list.
