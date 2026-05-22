import { PaymentForm } from "../../types/onboarding";

const PaymentsStep = ({
    data,
    setData,
}: {
    data: PaymentForm;
    setData: (d: PaymentForm) => void;
}) => {
    return (
        <div>
            <h2>Payment Setup</h2>

            <select
                value={data.gateway || ""}
                onChange={(e) =>
                    setData({ ...data, gateway: e.target.value as any })
                }
            >
                <option value="">Select Gateway</option>
                <option value="razorpay">Razorpay</option>
                <option value="payu">PayU</option>
                <option value="cashfree">Cashfree</option>
                <option value="cod">COD</option>
            </select>

            <input
                placeholder="Key ID"
                value={data.keyId}
                onChange={(e) =>
                    setData({ ...data, keyId: e.target.value })
                }
            />
        </div>
    );
};

export default PaymentsStep;