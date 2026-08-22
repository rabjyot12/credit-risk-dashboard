function renderApplicationForm() {
    const container = document.getElementById("application-form-section");

    // Clear previous form if the view is opened again
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = "New Credit Application";

    const description = document.createElement("p");
    description.textContent =
        "Enter the applicant's financial information to generate a credit-risk prediction.";

    const form = document.createElement("form");

    function createNumberField(
        name,
        labelText,
        options = {}
    ) {
        const wrapper = document.createElement("div");

        const label = document.createElement("label");
        label.htmlFor = name;
        label.textContent = labelText;

        const input = document.createElement("input");
        input.type = "number";
        input.id = name;
        input.name = name;

        if (options.required) {
            input.required = true;
        }

        if (options.min !== undefined) {
            input.min = options.min;
        }

        if (options.max !== undefined) {
            input.max = options.max;
        }

        if (options.step !== undefined) {
            input.step = options.step;
        }

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        return wrapper;
    }


    // 1. Revolving utilization
    form.appendChild(
        createNumberField(
            "revolving_utilization_unsecured_lines",
            "Revolving Utilization of Unsecured Lines",
            {
                required: true,
                min: 0,
                step: "any"
            }
        )
    );


    // 2. Age
    form.appendChild(
        createNumberField(
            "age",
            "Age",
            {
                required: true,
                min: 18,
                max: 99,
                step: 1
            }
        )
    );


    // 3. 30-59 days past due
    form.appendChild(
        createNumberField(
            "number_of_time_30_59_days_past_due_not_worse",
            "Number of Times 30-59 Days Past Due",
            {
                required: true,
                min: 0,
                step: 1
            }
        )
    );


    // 4. Debt ratio
    form.appendChild(
        createNumberField(
            "debt_ratio",
            "Debt Ratio",
            {
                required: true,
                min: 0,
                step: "any"
            }
        )
    );


    // 5. Monthly income
    form.appendChild(
        createNumberField(
            "monthly_income",
            "Monthly Income (Optional)",
            {
                min: 0,
                step: "any"
            }
        )
    );


    // 6. Open credit lines and loans
    form.appendChild(
        createNumberField(
            "number_of_open_credit_lines_and_loans",
            "Number of Open Credit Lines and Loans",
            {
                required: true,
                min: 0,
                step: 1
            }
        )
    );


    // 7. 90 days late
    form.appendChild(
        createNumberField(
            "number_of_times_90_days_late",
            "Number of Times 90 Days Late",
            {
                required: true,
                min: 0,
                step: 1
            }
        )
    );


    // 8. Real estate loans
    form.appendChild(
        createNumberField(
            "number_real_estate_loans_or_lines",
            "Number of Real Estate Loans or Lines",
            {
                required: true,
                min: 0,
                step: 1
            }
        )
    );


    // 9. 60-89 days past due
    form.appendChild(
        createNumberField(
            "number_of_time_60_89_days_past_due_not_worse",
            "Number of Times 60-89 Days Past Due",
            {
                required: true,
                min: 0,
                step: 1
            }
        )
    );


    // 10. Dependents
    form.appendChild(
        createNumberField(
            "number_of_dependents",
            "Number of Dependents (Optional)",
            {
                min: 0,
                step: 1
            }
        )
    );


    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "Generate Credit Risk Prediction";
    submitButton.classList.add("primary-button");

    form.appendChild(submitButton);


    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        try {
            const applicationData = {
                revolving_utilization_unsecured_lines:
                    Number(
                        document.getElementById(
                            "revolving_utilization_unsecured_lines"
                        ).value
                    ),

                age:
                    Number(
                        document.getElementById("age").value
                    ),

                number_of_time_30_59_days_past_due_not_worse:
                    Number(
                        document.getElementById(
                            "number_of_time_30_59_days_past_due_not_worse"
                        ).value
                    ),

                debt_ratio:
                    Number(
                        document.getElementById("debt_ratio").value
                    ),

                monthly_income:
                    document.getElementById("monthly_income").value === ""
                        ? null
                        : Number(
                            document.getElementById("monthly_income").value
                        ),

                number_of_open_credit_lines_and_loans:
                    Number(
                        document.getElementById(
                            "number_of_open_credit_lines_and_loans"
                        ).value
                    ),

                number_of_times_90_days_late:
                    Number(
                        document.getElementById(
                            "number_of_times_90_days_late"
                        ).value
                    ),

                number_real_estate_loans_or_lines:
                    Number(
                        document.getElementById(
                            "number_real_estate_loans_or_lines"
                        ).value
                    ),

                number_of_time_60_89_days_past_due_not_worse:
                    Number(
                        document.getElementById(
                            "number_of_time_60_89_days_past_due_not_worse"
                        ).value
                    ),

                number_of_dependents:
                    document.getElementById("number_of_dependents").value === ""
                        ? null
                        : Number(
                            document.getElementById(
                                "number_of_dependents"
                            ).value
                        )
            };


            const result = await submitApplication(applicationData);


            // Backend is the source of truth.
            // The newly-created prediction is opened immediately.
            openReview(result.prediction_id);

        } catch (error) {
            alert(`Could not submit application: ${error.message}`);
        }
    });


    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(form);
}