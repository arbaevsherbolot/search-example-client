"use client";

import React, { useState, useEffect } from "react";
import * as API from "@/../api";
import styles from "@/lib/styles/Page.module.scss";

type Result = {
  content: string;
};

export default function SearchClient() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [result, setResult] = useState<Result[] | null>(null);
  const [resultCount, setResultCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setResult(null);

      try {
        const { result } = await API.search.search(searchQuery);

        setResult(result);
        setResultCount(result.length);
        setError(null);
      } catch (e: any) {
        console.error(e.message);
        setError(
          e.msg || "An error occurred while fetching results. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchData, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleChangeSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={styles.page_wrapper}>
      <input
        className={styles.input}
        type="text"
        value={searchQuery}
        onChange={handleChangeSearchQuery}
        placeholder="Search..."
      />

      <span className={styles.count}>Search result: {resultCount}</span>

      <div className={styles.content_wrapper}>
        {isLoading && <span className={styles.load}>Loading...</span>}
        {error && <span className={styles.error}>{error}</span>}

        {result &&
          result.map((item, idx) => (
            <div key={idx} className={styles.content}>
              {item.content}
            </div>
          ))}
      </div>
    </div>
  );
}
