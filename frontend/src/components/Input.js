import "./Input.css";

const Input = ({ label, type, value, setValue, error, setError, isValid }) => {
  return (
    <>
      <label>
        {label}
        <input
          type={type}
          onBlur={(event) => {
            const value = event.target.value;
            setValue(value);
            setError(isValid(value));
          }}
        />
      </label>
      {error !== "" && <span className="Error">{error}</span>}
    </>
  );
};

export default Input;
