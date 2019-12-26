import { createStore, applyMiddleware } from "redux";
import thunk from "../src/redux-thunk-plus";
import fetch from "node-fetch";

test("Should support functional action", async () => {
  const store = createSampleStore((state = { counter: 0 }, action) => {
    switch (action.type) {
      case INCREMENT_COUNTER:
        return {
          ...state,
          counter: state.counter + 1
        };
      default:
        return state;
    }
  });

  store.dispatch(incrementAsync());
  store.dispatch(incrementAsync());

  await delayIn(1100);

  expect(store.getState()).toEqual({
    counter: 2
  });
});

test("Should support $async action", async () => {
  const fn = jest.fn();
  const store = createSampleStore(fn);

  store.dispatch(withdrawMoney(100));

  expect(fn.mock.calls[1][1].amount).toBe(100);

  await store.dispatch(makeASandwichWithSecretSauce("My partner")).then(() => {
    console.log("Done!");
  });

  expect(fn.mock.calls[2][1].forPerson).toBe("My partner");
  expect(fn.mock.calls[2][1].secretSauce.length).toBeGreaterThan(0);
});

const delayIn = interval =>
  new Promise(resolve => setTimeout(resolve, interval));

function createSampleStore(reducer) {
  return createStore(reducer, applyMiddleware(thunk));
}

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

function fetchSecretSauce() {
  return fetch("https://www.google.com/search?q=secret+sauce").then(res =>
    res.text()
  );
}

function makeASandwich(forPerson, secretSauce) {
  return {
    type: "MAKE_SANDWICH",
    forPerson,
    secretSauce
  };
}

function apologize(fromPerson, toPerson, error) {
  return {
    type: "APOLOGIZE",
    fromPerson,
    toPerson,
    error
  };
}

function withdrawMoney(amount) {
  return {
    type: "WITHDRAW",
    amount
  };
}

function makeASandwichWithSecretSauce(forPerson) {
  return {
    $async: fetchSecretSauce,
    success: sauce => makeASandwich(forPerson, sauce),
    error: error => apologize("The Sandwich Shop", forPerson, error)
  };
}
