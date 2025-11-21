import '../Styles/Method.css'
interface MyVars {
  MethodName: string;
  onSelect: (method: string) => void;
}

function Method({ MethodName, onSelect }: MyVars) {
  return (
    <span className='method'>
      <button className={MethodName} onClick={() => onSelect(MethodName)}>
        {MethodName}
      </button>
    </span>
  );
}

export default Method;
