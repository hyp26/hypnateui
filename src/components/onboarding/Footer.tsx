const Footer = ({ onNext, loading }: any) => {
    return (
        <button onClick={onNext} disabled={loading}>
            {loading ? "Saving..." : "Next"}
        </button>
    );
};

export default Footer;