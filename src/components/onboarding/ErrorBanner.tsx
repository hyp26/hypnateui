const ErrorBanner = ({ error }: { error: string }) => {
    if (!error) return null;

    return (
        <div style={{ color: "red", marginBottom: 10 }}>
            {error}
        </div>
    );
};

export default ErrorBanner;