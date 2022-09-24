import { useCallback } from 'react';
import { QuantityListProps } from './types';

function QuantityList({ quantity, setSelectedQuantity }: QuantityListProps) {
  const createArr = Array.from({ length: quantity }, (_, k) => k + 1);

  const select = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const qnty = event.target.value;

      setSelectedQuantity(qnty);
    },
    [setSelectedQuantity],
  );

  return (
    <div className="flex">
      <select
        onChange={select}
        className="block w-14 p-2 font-barlow text-lg bg-transparent border bg-gray-700 border-gray-400 text-white"
      >
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
