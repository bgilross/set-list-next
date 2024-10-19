import classNames from 'classnames'

const TextInput = ({ value, onChange, placeHolder, inputClassName }) => {
  const inputClasses = classNames(
    '   p-3 border border-gray-300 rounded-lg w-96 text-lg text-gray-700 shadow-lg group group-hover:ring-2 group-hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-105 group-hover:scale-105 transition-all duration-1000 ease-in-out  group-hover:shadow-xl placeholder-gray-400 focus:border-indigo-500 bg-green-100',
    inputClassName
  )

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeHolder}
      className={inputClasses}
    />
  )
}
export default TextInput
