export default function Footer({ step, onNext, onBack }: any) {
    return (
        <div style={{ marginTop: 20 }}>
            {step > 1 && <button onClick={onBack}>Back</button>}
            <button onClick={onNext}>Next</button>
        </div>
    );
}