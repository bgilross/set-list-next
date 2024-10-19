import {
  TiArrowUnsorted,
  TiArrowSortedDown,
  TiArrowSortedUp,
} from 'react-icons/ti'
import Table from './Table'
import useSort from '../lib/use-sort'
import className from 'classnames'

function SortableTable(props) {
  const { config, data, sortedHeadersClassName, iconClassName } = props
  const { sortOrder, sortBy, sortedData, handleClick } = useSort(data, config)

  const iconClassNameFinal = className(iconClassName, 'flex items-center')

  const updatedConfig = config.map((column) => {
    if (!column.sortValue) {
      return column
    }

    return {
      ...column,
      header: () => (
        <th
          className={sortedHeadersClassName}
          onClick={() => handleClick(column.label)}
        >
          <div className={iconClassNameFinal}>
            {getIcons(column.label, sortBy, sortOrder)}
            {column.label}
          </div>
        </th>
      ),
      render: (item, index) => column.render(item, index),
    }
  })

  return <Table {...props} data={sortedData} config={updatedConfig} />
}

function getIcons(label, sortBy, sortOrder) {
  if (label !== sortBy) {
    return (
      <div>
        <TiArrowUnsorted />
      </div>
    )
  }
  if (sortOrder === null) {
    return (
      <div>
        <TiArrowUnsorted />
      </div>
    )
  } else if (sortOrder === 'asc') {
    return (
      <div>
        <TiArrowSortedDown />
      </div>
    )
  } else if (sortOrder === 'desc') {
    return (
      <div>
        <TiArrowSortedUp />
      </div>
    )
  }
}

export default SortableTable
