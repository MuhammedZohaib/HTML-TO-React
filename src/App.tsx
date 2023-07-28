import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import MaxHeightTextarea from "./components/TextArea";
import { useEffect, useReducer, useRef } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import { download } from "./hooks/Download";
import ResponsiveAppBar from "./components/ResponsiveAppBar";

type ActionType =
  | { type: "SetIsHTML"; payload: boolean }
  | { type: "SetJSX"; payload: string }
  | { type: "SetIsDisbled"; payload: boolean }
  | { type: "SetConverted"; payload: boolean }
  | { type: "SetShowError"; payload: boolean };

type State = {
  isHTML: boolean;
  JSX: string;
  disable: boolean;
  converted: boolean;
  showError: boolean;
};

const initialState: State = {
  isHTML: false,
  JSX: "",
  disable: true,
  converted: false,
  showError: false,
};

const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case "SetConverted":
      return { ...state, converted: action.payload };
    case "SetIsHTML":
      return { ...state, isHTML: action.payload };
    case "SetJSX":
      return { ...state, JSX: action.payload };
    case "SetIsDisbled":
      return { ...state, disable: action.payload };
    case "SetShowError":
      return { ...state, showError: action.payload };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const htmlField = useRef<HTMLTextAreaElement>(null);
  const JSXField = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleClick = () => dispatch({ type: "SetIsHTML", payload: false });
    const textareaElement = htmlField.current;
    if (textareaElement) {
      textareaElement.addEventListener("click", handleClick);
    }

    return () => {
      if (textareaElement) {
        textareaElement.removeEventListener("click", handleClick);
      }
    };
  }, [state.isHTML]);

  const handleConversion = () => {
    const regex = /<("[^"]*"|'[^']*'|[^'">])*>/;
    const text = htmlField.current?.value;
    if (text) {
      const value = regex.test(htmlField.current?.value);
      if (!value) {
        dispatch({ type: "SetIsHTML", payload: true });
        dispatch({ type: "SetJSX", payload: "" });
      } else {
        dispatch({ type: "SetIsHTML", payload: false });
        dispatch({ type: "SetIsDisbled", payload: false });

        dispatch({
          type: "SetJSX",
          payload: `import React from 'react';
  
        const Component = () => {
          return (
            <>
              ${text}
            </>
          );
        };
        export default Component;
        `,
        });
        dispatch({ type: "SetConverted", payload: true });
      }
    }
  };

  return (
    <>
      <ResponsiveAppBar></ResponsiveAppBar>
      <Box
        display={"flex"}
        gap={2}
        justifyContent={"center"}
        alignItems={"center"}
        flexDirection={"column"}
        position={"relative"}
      >
        <Typography variant={"h6"} mt={5}>
          Convert HTML to React Components
        </Typography>
        <Typography variant="subtitle1">
          React Functional Components made easy
        </Typography>
        <MaxHeightTextarea
          placeholder="Enter Your Markup Here"
          ref={htmlField}
          marginTop="10px"
          disabled={false}
          maxrows={6}
        ></MaxHeightTextarea>
        <Button variant="outlined" onClick={handleConversion}>
          Convert
        </Button>
        <Collapse in={state.isHTML}>
          <Alert
            style={{ position: "absolute", top: "1rem", right: "1rem" }}
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  dispatch({ type: "SetIsHTML", payload: false });
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            Please Enter A Valid HTML
          </Alert>
        </Collapse>
        <Collapse in={state.showError}>
          <Alert
            style={{ position: "absolute", top: "1rem", right: "1rem" }}
            severity="error"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  dispatch({ type: "SetShowError", payload: false });
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            No JSX Conversion Detected
          </Alert>
        </Collapse>
        <MaxHeightTextarea
          ref={JSXField}
          placeholder=""
          marginTop=""
          disabled={state.disable}
          value={state.JSX}
          maxrows={9}
        ></MaxHeightTextarea>
        <Box
          sx={{
            display: "flex",
            "& > *": {
              m: 1,
            },
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              navigator.clipboard.writeText(state.JSX);
            }}
            variant="outlined"
          >
            Copy To Clipboard
          </Button>
          <Button
            onClick={() => {
              if (JSXField.current) {
                JSXField.current.value = "";
                dispatch({ type: "SetIsDisbled", payload: true });
              }
            }}
            variant="outlined"
          >
            Clear
          </Button>
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => {
              download(state.JSX, state.converted);
              if (!state.converted && !state.isHTML) {
                dispatch({ type: "SetShowError", payload: true });
              }
            }}
            variant="outlined"
          >
            Download
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default App;
