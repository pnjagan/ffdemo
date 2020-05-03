import React from "react";
import ReactDOM from "react-dom";

import { log } from "./App";
//import App from "./CalcApp";
// import { App } from "./App";

import App from "./DonationApp";

import { createStore, applyMiddleware, compose } from "redux";
import createSagaMiddleware, { END } from "redux-saga";
import { Provider } from "react-redux";
import { put, takeLatest, all, select } from "redux-saga/effects";
import assign from "lodash/assign";
import { combineReducers } from "redux";
import createReduxPromiseListener from "redux-promise-listener";
import { FORM_ERROR } from "final-form";

const isBlank = (text) => {
  //true is null or undefined or ''

  let retVal = false;

  if (text == null) {
    retVal = true;
  } else if (text === "") {
    retVal = true;
  }
  return retVal;
};

const reduxPromiseListener = createReduxPromiseListener();
export const promiseListener = reduxPromiseListener;
// import rootSaga from "./state/sagas";
function* saveDonation(action) {
  log("Save donation sagas called :", action);

  if (
    action.payload.donationNum.startsWith("1") &&
    action.payload.donationAmount > 10
  ) {
    yield put({
      type: "SAVE_DONATION_SUCCESS",
      payload: {
        [FORM_ERROR]: "donation series 1 is invalid for amount more than 10",
        data: { donationStatus: "FAILED" },
      },
    });
  } else {
    yield put({
      type: "SAVE_DONATION_SUCCESS",
      payload: {
        data: { donationStatus: "SAVED", message: "Hurray, saved!" },
      },
    });
  }
}

function* rootSaga() {
  yield all([takeLatest("SAVE_DONATION", saveDonation)]);
}
let initValue = {};
const donateRed = (state = assign({}, initValue), action) => {
  log("Reducer called with state:", state, " action: ", action);
  return state;
};

const rootReducer = combineReducers({
  donate: donateRed,
});

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();

// dev tools middleware
// const reduxDevTools =  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

log("Root reducer");
log(rootReducer, sagaMiddleware);

const middlewares = [sagaMiddleware, reduxPromiseListener.middleware];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

let store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middlewares))
);

store.close = () => store.dispatch(END);

// run the saga
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
    {/* <CalcApp /> */}
  </Provider>,
  // </React.StrictMode>,
  document.getElementById("root")
);
