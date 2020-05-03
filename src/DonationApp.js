import React, { useState, useEffect } from "react";
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

const DonationForm = ({
  submitError,
  submitErrors,
  handleSubmit,
  form,
  submitting,
  pristine,
  values,
  error,
  hasSubmitErrors,
  dataFromServer,
}) => {
  const classes = styles();

  useEffect(() => {
    if (dataFromServer) {
      if (values.donationStatus !== dataFromServer.donationStatus) {
        form.change("donationStatus", dataFromServer.donationStatus);
      }
    }
  });
  return (
    <form onSubmit={handleSubmit}>
      <span className={classes.error}>{error}</span>
      <span className={classes.error}>{submitError}</span>
      <Grid container spacing={3} direction="column" alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h5" style={{ color: "blue" }} gutterBottom>
            Donation FORM
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Field name="donationStatus">
            {({ input, meta }) => {
              // log("INPUT :", input);
              return (
                <>
                  Donation status:<input readOnly {...input}></input>
                </>
              );
            }}
          </Field>
        </Grid>

        <Grid item xs={12}>
          <Field name="donationNum">
            {({ input, meta }) => {
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
                    <span className={classes.error}>{meta.submitError}</span>
                  )}
                  {meta.error && meta.touched && (
                    <span className={classes.error}>{meta.error}</span>
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
                  <span className={classes.error}>{meta.submitError}</span>
                )}
                {meta.error && meta.touched && (
                  <span className={classes.error}>{meta.error}</span>
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
                  <span className={classes.error}>{meta.submitError}</span>
                )}
                {meta.error && meta.touched && (
                  <span className={classes.error}>{meta.error}</span>
                )}
              </>
            )}
          </Field>
        </Grid>
        {/* -----------------------LIST of buttons below-------------------*/}

        <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit">
            Save
          </Button>
          <Button variant="contained" color="secondary">
            Clear
          </Button>
        </Grid>
      </Grid>
      {/* <FormServerUpdateEngine mutators={form.mutators} /> */}
    </form>
  );
};

function App() {
  function onClear(event) {
    log("clear Button clicked");
  }
  const [dataFromServer, setDataFromServer] = useState();

  return (
    <>
      <MakeAsyncFunction
        listener={promiseListener}
        start={"SAVE_DONATION"}
        resolve={"SAVE_DONATION_SUCCESS"}
        reject={"SAVE_DONATION_FAILURE"}
        setPayload={(action, payload) => {
          log("Set Payload called act:", action, " payload:", payload);

          return { ...action, payload: { ...payload } };
        }}
        getPayload={(action) => {
          log(
            "Get Payload new DOC status :",
            action.payload.data.new_donationStatus
          );
          setDataFromServer(action.payload.data);
          return action.payload;
        }}
      >
        {(asyncFunc) => (
          <Form
            onSubmit={asyncFunc}
            initialValues={{ donationStatus: "NEW" }}
            // mutators={{ setFieldData, setFieldValue }}
            decorators={
              [
                /*calculator*/
              ]
            }
            validate={(values) => {
              const errors = {};
              if (values.donationAmount > 100 && isBlank(values.donorName)) {
                errors.donorName =
                  "Donor is required if amount is more than 100";
              }

              return errors;
            }}
          >
            {(props) => (
              <DonationForm {...props} dataFromServer={dataFromServer} />
            )}
          </Form>
        )}
      </MakeAsyncFunction>
    </>
  );
}

export default App;
