import { Fragment } from 'react'
import className from 'classnames'
// "text-white pr-2 px-2" -- Header stylings

function Table({
  data,
  config,
  keyFn,
  unsortedHeadersClassName,
  cellsClassName,
  rowsClassName,
  tableClassName,
  headerRowClassName,
}) {
  const renderedHeaders = config.map((column, index) => {
    const isFirst = index === 0
    const isLast = index === config.length - 1

    return (
      <th
        key={column.label}
        className={`p-4 ${isFirst ? 'rounded-tl-lg' : ''} ${
          isLast ? 'rounded-tr-lg' : ''
        }`}
      >
        {column.label}
      </th>
    )
  })

  const tableClasses = className(
    tableClassName,
    'table-auto border-spacing-2 w-full rounded-lg'
  )
  const headerRowClasses = className(
    headerRowClassName,
    'border-b-2 rounded-lg'
  )

  const renderedRows = data.map((rowData, index) => {
    const renderedCells = config.map((column) => {
      return (
        <td className={rowsClassName} key={column.label}>
          {column.render(rowData)}
        </td>
      )
    })
    return (
      <tr className={cellsClassName} key={keyFn(rowData)}>
        {renderedCells}
      </tr>
    )
  })
  return (
    <table className={tableClasses}>
      <thead className="rounded-lg">
        <tr className={headerRowClasses}>{renderedHeaders}</tr>
      </thead>
      <tbody>{renderedRows}</tbody>
    </table>
  )
}

export default Table
