export default function Field({ label, children }: any) {
    return (
        <div style={{ marginBottom: 12 }}>
            <label>{label}</label>
            {children}
        </div>
    );
}