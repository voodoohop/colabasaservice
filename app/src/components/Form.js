import React from "react";
import Form from "@rjsf/material-ui";
import Button from '@material-ui/core/Button'
import Debug from "debug";
import { Box, Typography } from "@material-ui/core";
import HelpModal from "./HelpModal";

const debug = Debug("Form");

const FormView = ({ input, status, colabState, metadata, nodeID, onSubmit, onCancel}) => {

    debug("metadata", metadata);
    
    const filledFormNoSocial = getFormInputs(input, metadata);

    if (!filledFormNoSocial)
        return null;

    const filledForm = addSocialCheckbox(filledFormNoSocial);

    debug("colabState", colabState);
    debug("filledForm", filledForm);

    const showSubmit = status === "disconnected" || status === "ready" && colabState !== "running" ;
    const showCancel = false; //!showSubmit && input.formAction !== "cancel";

    const inProgress = false//!!(input && input.formAction);
    const formDisabled = status === "disconnected" || inProgress;

    debug("nodeID",nodeID, formDisabled)
    const uiSchema = getUISchema(filledForm, metadata?.form?.properties, showSubmit)
    
    debug("form uiSchema", uiSchema, filledForm, showSubmit)



    return <Form
        schema={{properties: filledForm}}
        uiSchema={uiSchema}
        onSubmit={({formData}) => onSubmit(formData)}
        disabled={formDisabled || colabState === "running"}
    >
        <Box m={1}>
            { showSubmit ? <Button type="submit" disabled={formDisabled} >
                        [ {inProgress ? "Submitting..." : "Submit" } ] 
                    </Button>
                : null
            }
                    
            { showCancel && <Button type="button" color="secondary" onClick={onCancel} disabled={formDisabled} >
                        [ {inProgress ? "Stopping...": "Stop"} ]
                    </Button>
            }
            {!showSubmit || formDisabled && <HelpModal/>}
            
        </Box>
    </Form>
}

export default React.memo(FormView)


const addSocialCheckbox = (filledFormNoSocial) => 
    ({
        ...filledFormNoSocial,
        social: { 
            type: "boolean", 
            title: "Post to Pollinations' social media feeds", 
            default: true }
    });

function getFormInputs(ipfs, metadata) {
    if ((metadata === undefined) || (metadata === null)) return;
    ipfs = ipfs || {};

    return Object.fromEntries(Object.entries(metadata.form.properties).map(
            ([formKey, prop]) => [formKey, formKey in ipfs ? { ...prop, "default": ipfs[formKey] } : prop]))
}


const getUISchema = (filledForm, enabled) => {
    debug("getUISchema", filledForm, enabled);
    return Object.fromEntries(Object.keys(filledForm).map(key => [key, toSchema(key,filledForm[key].type, enabled)]))
};    


const toSchema = (key, type, enabled) => {
    const typeMappings = {
        "boolean": "radio",
        "string": "text",
        "number": "updown",
    };
    
    const prefixMappings = {
        "file_":"file",
        "num_":"updown"
    };
    
    // TODO: enable prefixMappings

    debug("Got type",type,"Looking for", key);

    const widget = typeMappings[type] || "text";
    return { 
        "ui:widget": widget,
        "ui_disabled": !enabled
    }

}
