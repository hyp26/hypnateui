import React from "react";
import { BusinessForm } from "../../types/onboarding";

const BusinessStep = ({
    data,
    setData,
    error,
}: {
    data: BusinessForm;
    setData: (d: BusinessForm) => void;
    error?: string;
}) => {
    return (
        <div>
            <h2>Business Info</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                placeholder="Business Name"
                value={data.businessName}
                onChange={(e) =>
                    setData({ ...data, businessName: e.target.value })
                }
            />

            <input
                placeholder="Mobile"
                value={data.mobileNo}
                onChange={(e) =>
                    setData({ ...data, mobileNo: e.target.value })
                }
            />
        </div>
    );
};

export default BusinessStep;