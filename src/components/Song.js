const Song = ({ song }) => {
  return (
    <div className="relative group p-6 bg-white rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      {/* 3D Effect by combining shadow and border-radius */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg opacity-50 pointer-events-none"></div>

      {/* Song Information */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-gray-800">{song.title}</h3>
        <p className="text-gray-500">{song.artist}</p>
      </div>

      {/* Add to List Button */}
      <button
        onClick={() => onAddToList(song)}
        className="absolute bottom-4 right-4 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-110 hover:bg-blue-500"
      >
        Add to List
      </button>
    </div>
  )
}
export default Song
