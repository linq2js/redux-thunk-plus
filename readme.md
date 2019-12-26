# redux-thunk-plus

Advanced thunk middleware for Redux

## Simple thunk

```js
const INCREMENT_COUNTER = "INCREMENT_COUNTER";

function increment() {
  return {
    type: INCREMENT_COUNTER
  };
}

function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `dispatch`
      dispatch(increment());
    }, 1000);
  };
}
```

## Advanced thunk

```js
const DATA_LOADING = "DATA_LOADING";
const DATA_LOADED = "DATA_LOADED";

function fetchData(keyword = "Hi") {
  return fetch(`https://www.google.com/search?q=${keyword}`).then(res =>
    res.text()
  );
}

function loadData1() {
  return {
    // support promise factory
    $async: fetchData,
    before: () => ({ type: DATA_LOADING }),
    after: () => ({ type: DATA_LOADED })
  };
}

function loadData2() {
  return {
    // support promise object
    $async: fetchData("Xiao"),
    before: () => ({ type: DATA_LOADING }),
    after: () => ({ type: DATA_LOADED })
  };
}

function loadData3() {
  return {
    // support multiple promises/promise factories
    $async: [fetchData("Xiao"), fetchData("Hi")],
    before: () => ({ type: DATA_LOADING }),
    after: () => ({ type: DATA_LOADED }),
    success: payloads => console.log(payloads)
  };
}
```
