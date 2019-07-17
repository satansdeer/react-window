import React from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import InfiniteLoader from "react-window-infinite-loader";

import "./index.css";

let items = {};
let requestCache = {};

const getUrl = (rows, start) =>
  `https://public.opendatasoft.com/api/records/1.0/search/?dataset=worldcitiespop&sort=population&fields=population,accentcity&rows=${rows}&start=${start}&facet=country`;

const Row = ({ index, style }) => {
  const item = items[index];
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

export default () => (
  <AutoSizer>
    {({ height, width }) => (
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItems}
        itemCount={1000}
      >
        {({ onItemsRendered, ref }) => (
          <List
            className="List"
            height={height}
            itemCount={1000}
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
