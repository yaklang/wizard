import { Checkbox, Table, Tooltip } from "antd";
import type { TableProps } from "antd";
import classNames from "classnames";
import ResizeObserver from "rc-resize-observer";
import React, { useEffect, useRef, useState } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import "./VirtualTable.css";

export const VirtualTable = <RecordType extends object>(
  props: TableProps<RecordType>
) => {
  const { columns, scroll, rowSelection, rowKey = "" } = props;
  const [tableWidth, setTableWidth] = useState(0);

  const widthColumnCount = columns!.filter(({ width }) => !width).length;
  const mergedColumns = columns!.map((column) => {
    if (column.width) {
      return column;
    }

    return {
      ...column,
      width: Math.floor(tableWidth / widthColumnCount),
    };
  });

  const gridRef = useRef<any>();
  const [connectObject] = useState<any>(() => {
    const obj = {};
    Object.defineProperty(obj, "scrollLeft", {
      get: () => {
        if (gridRef.current) {
          return gridRef.current?.state?.scrollLeft;
        }
        return null;
      },
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({ scrollLeft });
        }
      },
    });

    return obj;
  });

  const resetVirtualGrid = () => {
    gridRef.current?.resetAfterIndices({
      columnIndex: 0,
      shouldForceUpdate: true,
    });
  };

  useEffect(() => resetVirtualGrid, [tableWidth]);

  const renderVirtualList = (
    rawData: readonly object[],
    { scrollbarSize, ref, onScroll }: any
  ) => {
    ref.current = connectObject;
    const totalHeight = rawData.length * 54;

    return (
      <Grid
        ref={gridRef}
        className="virtual-grid"
        columnCount={mergedColumns.length + 1} // +1 for the selection column
        columnWidth={(index: number) => {
          if (index === 0) {
            return 50; // Width for the checkbox column
          }
          const { width } = mergedColumns[index - 1];
          return totalHeight > Number(scroll!.y)! &&
            index === mergedColumns.length
            ? (width as number) - scrollbarSize - 1
            : (width as number);
        }}
        height={scroll!.y as number}
        rowCount={rawData.length}
        rowHeight={() => 54}
        width={tableWidth}
        onScroll={({ scrollLeft }: { scrollLeft: number }) => {
          onScroll({ scrollLeft });
        }}
      >
        {({
          columnIndex,
          rowIndex,
          style,
        }: {
          columnIndex: number;
          rowIndex: number;
          style: React.CSSProperties;
        }) => {
          if (columnIndex === 0) {
            const keyVal = (rawData[rowIndex] as any)[rowKey as string];
            const isChecked = rowSelection?.selectedRowKeys?.includes(keyVal);

            return (
              <div className="virtual-table-cell" style={style}>
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => {
                    const checkedKeys = rowSelection?.selectedRowKeys || [];
                    if (e.target.checked) {
                      rowSelection?.onChange?.([...checkedKeys, keyVal], []);
                    } else {
                      rowSelection?.onChange?.(
                        checkedKeys.filter((item) => item !== keyVal),
                        []
                      );
                    }
                  }}
                />
              </div>
            );
          }

          return (
            <div
              className={classNames("virtual-table-cell", {
                "virtual-table-cell-last": columnIndex === mergedColumns.length,
              })}
              style={style}
            >
              <Tooltip
                placement="topLeft"
                title={
                  (rawData[rowIndex] as any)[
                    (mergedColumns as any)[columnIndex - 1].dataIndex
                  ]
                }
              >
                {
                  (rawData[rowIndex] as any)[
                    (mergedColumns as any)[columnIndex - 1].dataIndex
                  ]
                }
              </Tooltip>
            </div>
          );
        }}
      </Grid>
    );
  };

  return (
    <ResizeObserver
      onResize={({ width }) => {
        setTableWidth(width);
      }}
    >
      <Table
        {...props}
        className="virtual-table"
        columns={mergedColumns}
        pagination={false}
        rowSelection={rowSelection}
        components={{
          body: renderVirtualList,
        }}
      />
    </ResizeObserver>
  );
};
