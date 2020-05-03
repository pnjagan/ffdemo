import React from "react";
import { render } from "react-dom";
import { Form, Field } from "react-final-form";
import createDecorator from "./ffcalc";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const onSubmit = async (values) => {
  await sleep(300);
  window.alert(JSON.stringify(values, 0, 2));
};

const calculator = createDecorator(
  {
    field: "valueA", // when minimum changes...
    updates: {
      // ...update maximum to the result of this function
      total: (valueA, allValues) => {
        let van = isNaN(Number(valueA)) ? 0 : Number(valueA);
        let vbn = isNaN(Number(Number(allValues.valueB)))
          ? 0
          : Number(Number(allValues.valueB));

        return van + vbn;
      },
    },
  },
  {
    field: "valueB", // when maximum changes...
    updates: {
      // update minimum to the result of this function
      total: (valueB, allValues) => {
        let van = isNaN(Number(Number(allValues.valueA)))
          ? 0
          : Number(Number(allValues.valueA));
        let vbn = isNaN(Number(valueB)) ? 0 : Number(valueB);
        return van + vbn;
      },
    },
  }
);

const App = () => (
  <div>
    <h1>Calculation Form</h1>

    <Form
      onSubmit={onSubmit}
      decorators={[calculator]}
      render={({ handleSubmit, reset, submitting, pristine, values }) => (
        <form onSubmit={handleSubmit}>
          <div>
            <label>valueA</label>
            <Field
              name="valueA"
              component="input"
              type="number"
              placeholder="Value A"
            />
          </div>
          <div>
            <label>valueB</label>
            <Field
              name="valueB"
              component="input"
              type="number"
              placeholder="Value B"
            />
          </div>
          <hr />
          {/**----------------------------------------------------- */}
          <hr />
          <div>
            <label>Total</label>
            <Field
              name="total"
              component="input"
              type="number"
              readOnly
              placeholder="Total"
            />
          </div>
          <hr />
          {/* ------------------RESULT------------------ */}
          <div className="buttons">
            <button type="submit" disabled={submitting}>
              Submit
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={submitting || pristine}
            >
              Reset
            </button>
          </div>
          {/* ------------------FINAL------------------ */}
          <pre>{JSON.stringify(values, 0, 2)}</pre>
        </form>
      )}
    />
  </div>
);

export default App;
