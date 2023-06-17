import logo from './logo.svg';
import './App.css';
import InfiniteGrid from './InfiniteGrid';
import { useState } from 'react';
// import Demo from './Demo';

const MIN_BATCH_SIZE = 20;
const MAXIMUM_ITEMS = 200;

const generateItems = (previousList) => {
  const newList = [...previousList];
  const length = newList.length;
  for (let index = 0; index < MIN_BATCH_SIZE; index++) {
    newList.push(index + length);
  }
  return newList;
};

function App() {
  const [list, setList] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  const handleLoadMoreItems = ({ limit, offset }) => {
    const delay = 500; // random delay to simulate server response time

    setTimeout(() => {
      if (offset === MAXIMUM_ITEMS) {
        setList(list);
        setHasNextPage(false);
      } else {
        setList(generateItems(list));
      }
    }, delay);
  };

  return (
    <div
      className="App"
      style={{
        padding: '32px',
      }}>
      <InfiniteGrid
        dataSource={list}
        limit={MIN_BATCH_SIZE}
        loadMoreItems={handleLoadMoreItems}
        columnCount={4}
        hasNextPage={hasNextPage}
        renderItem={({ value }) => value}
      />
    </div>
  );
}

export default App;
