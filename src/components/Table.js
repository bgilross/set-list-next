import React, { Fragment, cloneElement, isValidElement } from "react"
import className from "classnames"
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
		const rounding = `${isFirst ? "rounded-tl-lg" : ""} ${
			isLast ? "rounded-tr-lg" : ""
		}`

		// If a custom header renderer exists (e.g., for sortable columns), use it.
		if (typeof column.header === "function") {
			const headerEl = column.header()
			if (isValidElement(headerEl) && headerEl.type === "th") {
				// Merge classes while preserving existing ones.
				const existing = headerEl.props.className || ""
				return cloneElement(headerEl, {
					key: column.label,
					className: `${existing} p-4 ${rounding}`.trim(),
				})
			}
			// Fallback: wrap non-th content in th
			return (
				<th
					key={column.label}
					className={`p-4 ${rounding}`}
				>
					{headerEl}
				</th>
			)
		}

		// Default static header
		return (
			<th
				key={column.label}
				className={`p-4 ${rounding}`}
			>
				{column.label}
			</th>
		)
	})

	const tableClasses = className(
		tableClassName,
		"table-auto border-spacing-2 w-full rounded-lg"
	)
	const headerRowClasses = className(
		headerRowClassName,
		"border-b-2 rounded-lg"
	)

	const renderedRows = data.map((rowData, index) => {
		const renderedCells = config.map((column) => {
			return (
				<td
					className={rowsClassName}
					key={column.label}
				>
					{column.render(rowData)}
				</td>
			)
		})
		return (
			<tr
				className={cellsClassName}
				key={keyFn(rowData)}
			>
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
