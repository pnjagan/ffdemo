import React, { useState } from "react";
import { TextField, Grid, Typography, Button } from "@material-ui/core";
import { Form, Field, FormSpy } from "react-final-form";
import { promiseListener } from "./index";
import { FORM_ERROR } from "final-form";

import MakeAsyncFunction from "react-redux-promise-listener";
import { makeStyles } from "@material-ui/core/styles";
import setFieldData from "final-form-set-field-data";
import createDecorator from "./ffcalc";
import { MutableState, Mutator } from "final-form";

const inspect = require("object-inspect");

let log = (...args) => {
  let str = "";
  for (let item of args) {
    let itype = typeof item;
    switch (itype) {
      case "object":
        str = str + inspect(item);
        break;
      case "function":
        str = str + inspect(item);
        break;
      default:
        str = str + item;
        break;
    }
  }
  console.log(str);
};

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

const styles = makeStyles((theme) => ({
  error: {
    color: "red",
  },
}));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const onSubmit = async (values) => {
  await sleep(300);
  window.alert(JSON.stringify(values, 0, 2));
};

const setFieldValue = (args, state) => {
  const [name, pvalue] = args;

  const field = state.fields[name];
  if (field) {
    log("setting value for :", name, " value ", pvalue);
    field.value = pvalue;
    log("mutable state field:", field);
  }
};

function App() {
  function onClear(event) {
    log("clear Button clicked");
  }
  const classes = styles();

  // log("setFieldValue *:", setFieldValue);

  // const [messageFromServer, setMessageFromServer] = useState();
  const [newDonStatus, setNewDonStatus] = useState();
  // const [newDoDefaultValue, setNewDoDefaultValue] = useState(false);

  // let newDonStatus = "";

  let messageFromServer = "";
  let newDoDefaultValue = "";

  // const FormServerUpdateEngine = (param) => {
  //   log("Param", param);

  //   return (

  //   );
  // };

  const calculator = createDecorator({
    field: "donationAmount", // when donorAmount
    updates: {
      // ...update maximum to the result of this function

      donorStatus: (donorAmount, allValues) => {
        //if (newDoDefaultValue) {
        //setNewDoDefaultValue(false);

        return newDonStatus;
        //}
        // } else {
        //   return donorStatus;
        // }
      },
      doubleAmount: (doubleAmount, allValues) => {
        return allValues.donationAmount * 2;
      },
    },
  });

  return (
    <>
      <div>
        FORM level HDR validation : purpose not blank if donation > 1000 and
        donor blank
      </div>
      <div>FORM level FIELD validation : donor not blank if amount > 100</div>

      <div> FIELD level VALIDATION: donation amount non-zero number</div>
      <div>...</div>

      <div>
        Submission HDR Error: Donation# starting 1 cannot be more than 10$
      </div>

      <div>
        Submission LINE ERROR : Donation# starting 2 cannot have purpose blank
      </div>
      <div>...</div>
      <div>
        ON SUCCESSFULL Submission , show a message that it is success and change
        the form status?
      </div>
      <div>
        ON FAILURE Submission , show a message and change the form status as
        well?
      </div>

      <MakeAsyncFunction
        listener={promiseListener}
        start={"SAVE_DONATION"}
        resolve={"SAVE_DONATION_SUCCESS"}
        reject={"SAVE_DONATION_FAILURE"}
        setPayload={(action, payload) => {
          log("Set Payload called act:", action, " payload:", payload);
          // setMessageFromServer("Donation detail being sent to server");
          return { ...action, payload: { ...payload } };
        }}
        getPayload={(action) => {
          log(
            "Get Payload new DOC status :",
            action.payload.data.new_donationStatus
          );
          setNewDonStatus(action.payload.data.new_donationStatus);
          // newDonStatus = action.payload.data.new_donationStatus;
          //setNewDoDefaultValue(true);

          if (action.payload.data.new_donationStatus === "SAVED") {
            // setMessageFromServer("Successfully saved !!!");
          } else if (action.payload.data.new_donationStatus === "FAILED") {
            // setMessageFromServer("SAVE of donation failed");
          } else {
            // setMessageFromServer("");
          }
          delete action.payload.data;
          log("Get Payload after TRIM action:", action);
          return action.payload;
        }}
      >
        {(asyncFunc) => (
          <Form
            onSubmit={asyncFunc}
            initialValues={{ donationStatus: "NEW" }}
            mutators={{ setFieldData, setFieldValue }}
            decorators={
              [
                /*calculator*/
              ]
            }
            validate={(values) => {
              const errors = {};
              if (values.donationAmount > 100 && isBlank(values.donorName)) {
                errors.donorName = "Donor is required if amount more than 100";
              }

              if (
                values.donationAmount > 1000 &&
                isBlank(values.donationPurpose)
              ) {
                errors[FORM_ERROR] =
                  "Purpose cannot blank if amount more than 1000";
              }

              return errors;
            }}
          >
            {({
              submitError,
              submitErrors,
              handleSubmit,
              form,
              submitting,
              pristine,
              values,
              error,
              hasSubmitErrors,
            }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <span className={classes.error}>{error}</span>
                  <span className={classes.error}>{submitError}</span>
                  <span style={{ color: "blue" }}>{messageFromServer}</span>
                  <FormSpy
                    subscription={{ values: true }}
                    onChange={({ values }) => {
                      log(
                        "vales in formspy ",
                        values,
                        "newDoDefaultValue ",
                        newDoDefaultValue,
                        "newDonStatus ",
                        newDonStatus
                      );

                      if (values) {
                        log(
                          "DOnor name prefix:" + values["donationNamePrefix"]
                        );
                        //setFieldValue
                        form.mutators.setFieldData("donorName", {
                          greeting: `Hello ${
                            values["donationNamePrefix"]
                              ? values["donationNamePrefix"]
                              : ""
                          }`,
                        });

                        log(" newDonStatus ::", newDonStatus);
                        form.mutators.setFieldValue(
                          "donationStatus",
                          newDonStatus
                        );

                        log("vales in formspy ", values);
                      }
                    }}
                  />
                  <Grid
                    container
                    spacing={3}
                    direction="column"
                    alignItems="center"
                  >
                    <Grid item xs={12}>
                      <Typography
                        variant="h5"
                        style={{ color: "blue" }}
                        gutterBottom
                      >
                        Donation FORM
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Field name="donationStatus">
                        {({ input, meta }) => {
                          // log("INPUT :", input);
                          return <input {...input}></input>;
                        }}
                      </Field>
                    </Grid>

                    <Grid item xs={12}>
                      <Field name="donationNum">
                        {({ input, meta }) => {
                          // log(
                          //   " Rendering of donation # Input : ",
                          //   input,
                          //   " meta: ",
                          //   meta
                          // );
                          return (
                            <>
                              <TextField
                                {...input}
                                id="donationNum "
                                label="donation #"
                                placeholder="001"
                                variant="outlined"
                              />
                              {meta.submitError && meta.touched && (
                                <span className={classes.error}>
                                  {meta.submitError}
                                </span>
                              )}
                              {meta.error && meta.touched && (
                                <span className={classes.error}>
                                  {meta.error}
                                </span>
                              )}
                            </>
                          );
                        }}
                      </Field>
                    </Grid>

                    <Grid item xs={12}>
                      <Field name="donorName">
                        {({ input, meta }) => (
                          <>
                            <TextField
                              {...input}
                              id="donorName"
                              label="Donor"
                              placeholder="fullname"
                              variant="outlined"
                            />
                            <span>{meta.data.greeting}</span>
                            {/* <span>{newDonStatus}</span> */}

                            {meta.submitError && meta.touched && (
                              <span className={classes.error}>
                                {meta.submitError}
                              </span>
                            )}
                            {meta.error && meta.touched && (
                              <span className={classes.error}>
                                {meta.error}
                              </span>
                            )}
                          </>
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={12}>
                      <Field
                        name="donationAmount"
                        validate={(value) => {
                          if (isNaN(Number(value))) {
                            return "Amount not valid";
                          } else if (Number(value) < 0) {
                            return "Amount is negative";
                          } else {
                            return undefined;
                          }
                        }}
                      >
                        {({ input, meta }) => (
                          <>
                            <TextField
                              {...input}
                              id="donationAmount"
                              placeholder="0.0"
                              label="amount"
                              variant="outlined"
                            />
                            {meta.submitError && meta.touched && (
                              <span className={classes.error}>
                                {meta.submitError}
                              </span>
                            )}
                            {meta.error && meta.touched && (
                              <span className={classes.error}>
                                {meta.error}
                              </span>
                            )}
                          </>
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={12}>
                      <Field name="donationPurpose">
                        {({ input, meta }) => (
                          <>
                            <TextField
                              {...input}
                              id="donationPurpose"
                              placeholder="Temple renovation"
                              label="purpose"
                              variant="outlined"
                            />
                            {meta.submitError && meta.touched && (
                              <span className={classes.error}>
                                {meta.submitError}
                              </span>
                            )}
                            {meta.error && meta.touched && (
                              <span className={classes.error}>
                                {meta.error}
                              </span>
                            )}
                          </>
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={12}>
                      <Field name="donationNamePrefix">
                        {({ input, meta }) => (
                          <>
                            <TextField
                              {...input}
                              id="donationNamePrefix"
                              placeholder="Srirama dasanudasan"
                              label="ramadasu"
                              variant="outlined"
                            />
                            {meta.submitError && meta.touched && (
                              <span className={classes.error}>
                                {meta.submitError}
                              </span>
                            )}
                            {meta.error && meta.touched && (
                              <span className={classes.error}>
                                {meta.error}
                              </span>
                            )}
                          </>
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={12}>
                      {" "}
                      <div>
                        <label>Double Amount</label>
                        <Field
                          name="doubleAmount"
                          component="input"
                          type="number"
                          readOnly
                          placeholder="DoubleAmount"
                        />
                      </div>
                    </Grid>

                    <Grid item xs={12}>
                      <Button variant="contained" color="primary" type="submit">
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={onClear}
                      >
                        Clear
                      </Button>
                    </Grid>
                  </Grid>
                  {/* <FormServerUpdateEngine mutators={form.mutators} /> */}
                </form>
              );
            }}
          </Form>
        )}
      </MakeAsyncFunction>
    </>
  );
}

export { App, log };
