import React from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";
import throttle from "lodash/throttle";

import "./index.css";

const itemsCount = 500;
let items = {};
let requestCache = {};

const getUrl = (rows, start) =>
  `https://public.opendatasoft.com/api/records/1.0/search/?dataset=worldcitiespop&sort=population&fields=population,accentcity&rows=${rows}&start=${start}&facet=country`;

const Row = ({ index, style }) => {
  const item = items[index];

  if (index + 1 >= itemsCount) return null;

  return (
    <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
      {item ? `${item.accentcity}: ${item.population}` : "Loading..."}
    </div>
  );
};

const isItemLoaded = ({ index }) => !!items[index];

const loadMoreItems = (visibleStartIndex, visibleStopIndex) => {
  const key = [visibleStartIndex, visibleStopIndex].join(":"); // 0:10
  if (requestCache[key]) {
    return;
  }

  const length = visibleStopIndex - visibleStartIndex;
  const visibleRange = [...Array(length).keys()].map(
    x => x + visibleStartIndex
  );
  const itemsRetrieved = visibleRange.every(index => !!items[index]);

  if (itemsRetrieved) {
    requestCache[key] = key;
    return;
  }

  return fetch(
    getUrl(length, visibleStartIndex)
  )
    .then(response => response.json())
    .then(data => {
      data.records.forEach((city, index) => {
        items[index + visibleStartIndex] = city.fields
      });
    })
    .catch(error => console.error("Error:", error));
};

const loadMoreItemsThrottled = throttle(loadMoreItems, 100);

export default () => (
  <AutoSizer>
    {({ height, width }) => (
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItemsThrottled}
        itemCount={itemsCount}
      >
        {({ onItemsRendered, ref }) => (
          <List
            className="List"
            height={height}
            itemCount={itemsCount}
            itemSize={35}
            width={width}
            ref={ref}
            onItemsRendered={onItemsRendered}
          >
            {Row}
          </List>
        )}
      </InfiniteLoader>
    )}
  </AutoSizer>
);
