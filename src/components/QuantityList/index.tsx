import { QuantityListProps } from './types';

function QuantityList({ quantity }: QuantityListProps) {
  const createArr = Array.from({ length: quantity }, (_, k) => k + 1);

  return (
    <div className="flex">
      <select className="block w-14 p-2 font-barlow text-lg bg-transparent border bg-gray-700 border-gray-400 text-white">
        {createArr.map((item) => (
          <option key={item.toString()} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

export default QuantityList;
