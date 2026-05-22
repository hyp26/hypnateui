import React from "react";
import Field from "./Field";

export default function BusinessStep() {
    return (
        <div>
            <h2>Business Info</h2>

            <Field label="Business Name">
                <input placeholder="Your business name" />
            </Field>

            <div className="ob-form-grid">
                <Field label="Industry">
                    <input />
                </Field>

                <Field label="Size">
                    <input />
                </Field>
            </div>
        </div>
    );
}