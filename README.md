### instructions

with hacky data setup:
```
git clone https://github.com/Great-Hill-Corporation/trueblocks-electron
npm install
cd test-server
npm install
cd ..
cd test-server && node index.js & cd .. && npm run dev && node src/electron-wait-react.js
```

If running against dappnode, instead of last step above, all you need to do is

```
npm run dev && node src/electron-wait-react.js
```

Right now we are extra hacky and are hardcoding api urls. The places to change for running against dappnode are:
Line 64 of src/App.js: change that to http://my.trueblocks.public.dappnode.eth/export?address=
src/address-list.json -- controls the monitor list.
