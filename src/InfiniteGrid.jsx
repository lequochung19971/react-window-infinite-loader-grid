import React, { createContext, forwardRef, useContext, useMemo, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { WindowScroller } from './WindowScroller';

const InfiniteGridContext = createContext({});
const useInfiniteGridContext = () => useContext(InfiniteGridContext);
const Cell = (props) => {
  const { columnIndex, rowIndex, style, data } = props;
  const { columnCount, hasNextPage, renderItem, renderLoadingItem } = useInfiniteGridContext();
  const itemIndex = rowIndex * columnCount + columnIndex;
  const cellValue = data[itemIndex];

  if (cellValue === undefined) {
    return hasNextPage ? (
      <div style={style} className="cell">
        {typeof renderLoadingItem === 'function' ? renderLoadingItem() : 'Loading...'}
      </div>
    ) : null;
  }

  return (
    <div style={style} className="cell">
      {renderItem({
        ...props,
        itemIndex,
        value: cellValue,
      })}
    </div>
  );
};

const InfiniteGrid = forwardRef((props, ref) => {
  const {
    dataSource,
    loadMoreItems,
    limit,
    columnCount = 1,
    rowHeight = 70,
    hasNextPage = true,
    renderItem,
    renderLoadingItem,
    // height = 500,
  } = props;
  const [state, setState] = useState({
    columnCount,
    columnWidth: 100,
    rowHeight,
    limit,
  });
  const upsertState = (changedState) => {
    setState((prev) => ({
      ...prev,
      ...changedState,
    }));
  };

  const rowCount = useMemo(() => {
    const nextRow = hasNextPage ? 1 : 0;
    return Math.ceil(dataSource.length / state.columnCount) + nextRow;
  }, [dataSource.length, state.columnCount, hasNextPage]);

  const value = useMemo(() => {
    return {
      ...state,
      renderItem,
      renderLoadingItem,
      rowCount,
      hasNextPage,
    };
  }, [hasNextPage, renderItem, renderLoadingItem, rowCount, state]);

  function onResize({ width }) {
    const { columnCount } = state;
    upsertState({
      // Subtracting 30 from `width` to accommodate the padding from the Bootstrap container
      columnWidth: width / columnCount,
    });
  }

  function isItemLoaded(index) {
    return index < rowCount - 1;
  }

  function handleLoadMoreItems(startIndex) {
    const limitRow = Math.ceil(state.limit / state.columnCount);
    const nextPage = Math.ceil(startIndex / limitRow);
    loadMoreItems?.({
      limit: state.limit,
      offset: nextPage * state.limit,
    });
  }

  const onItemsRenderedRef = useRef();

  const handleOnItemsRendered = (args) => {
    const {
      visibleRowStartIndex,
      visibleRowStopIndex,
      overscanRowStartIndex,
      overscanRowStopIndex,
    } = args;

    onItemsRenderedRef.current({
      //call onItemsRendered from InfiniteLoader so it can load more if needed
      overscanStartIndex: overscanRowStartIndex,
      overscanStopIndex: overscanRowStopIndex,
      visibleStartIndex: visibleRowStartIndex,
      visibleStopIndex: visibleRowStopIndex,
    });
  };

  return (
    <InfiniteGridContext.Provider value={value}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        loadMoreItems={handleLoadMoreItems}
        itemCount={rowCount}>
        {({ onItemsRendered, ref: refForInfinityLoader }) => {
          onItemsRenderedRef.current = onItemsRendered;
          return (
            <WindowScroller isGrid>
              {({ ref: refForWindowScroller, outerRef, style, onScroll }) => (
                <AutoSizer disableHeight onResize={onResize}>
                  {({ width }) => (
                    <Grid
                      width={width}
                      style={style}
                      height={window.innerHeight}
                      ref={(element) => {
                        console.log(element);
                        ref = element;
                        refForWindowScroller.current = element;
                        refForInfinityLoader.current = element;
                      }}
                      outerRef={outerRef}
                      itemData={dataSource}
                      className="Grid"
                      onItemsRendered={handleOnItemsRendered}
                      columnCount={state.columnCount}
                      rowCount={rowCount}
                      columnWidth={state.columnWidth}
                      rowHeight={state.rowHeight}
                      onScroll={onScroll}>
                      {Cell}
                    </Grid>
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          );
        }}
      </InfiniteLoader>
    </InfiniteGridContext.Provider>
  );
});
export default InfiniteGrid;
