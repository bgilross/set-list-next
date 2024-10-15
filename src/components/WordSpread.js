const WordSpread = ({ children }) => {
  const letters = typeof children === 'string' ? children.split('') : children

  return (
    <span className="group">
      {letters.map((char, index) => (
        <span
          key={index}
          className=" z-20 inline-block transition-transform duration-300 transform group-hover:wiggle group-hover:expand"
          style={{
            transitionDelay: `${index * 0.05}s`, // Stagger the animation
          }}
        >
          {char}
        </span>
      ))}
    </span>
  )
}
export default WordSpread
