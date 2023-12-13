"use client";

import React, { useState, useEffect } from "react";
import * as API from "@/../api";
import { getCookieValue, setCookie } from "@/lib/utils/cookies";
import styles from "@/lib/styles/Page.module.scss";

type Result = {
  content: string;
};

export default function SearchClient() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [result, setResult] = useState<Result[] | null>(null);
  const [resultCount, setResultCount] = useState<number>(0);
  const [counts, setCounts] = useState<number[]>([]);
  const [selectedCount, setSelectedCount] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setResult(null);

      try {
        const { result } = await API.search.search(searchQuery);
        const lastPage = await getCookieValue("lastPage");

        setResult(result);
        setResultCount(result.length);
        setCounts(
          Array.from({ length: result.length }, (_, index) => index + 1)
        );
        setSelectedCount(
          result.length > 0
            ? parseInt(lastPage) && parseInt(lastPage) < result.length
              ? parseInt(lastPage)
              : result.length || 1
            : undefined
        );
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

  const handleChangeCount = (count: number) => {
    setSelectedCount(count);
    setCookie("lastPage", `${count}`);
  };

  const formatText = (text: string) => {
    const formattedText = text.replace(/<<(.*?)>>/g, "<code>$1</code>");
    const boldifiedText = formattedText.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    return { __html: boldifiedText };
  };

  const renderCounts = () => {
    return counts.map((count, idx) => (
      <span
        key={idx}
        className={`${styles.count} ${
          selectedCount === count ? styles.selected : ""
        }`}
        onClick={() => handleChangeCount(count)}>
        {count}
      </span>
    ));
  };

  const renderResults = () => {
    if (isLoading) return <span className={styles.load}>Loading...</span>;
    if (error) return <span className={styles.error}>{error}</span>;

    const displayedResults = result?.slice(0, selectedCount || undefined);

    return (
      <div className={styles.content_wrapper}>
        {displayedResults &&
          displayedResults.map((item, idx) => {
            if (idx + 1 === selectedCount) {
              return (
                <div key={idx} className={styles.content}>
                  <span dangerouslySetInnerHTML={formatText(item.content)} />
                </div>
              );
            }
          })}
      </div>
    );
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

      <span className={styles.count}>
        {resultCount === 0 ? "Nothing found" : `Search result: ${resultCount}`}
      </span>

      <div className={styles.counts_wrapper}>{renderCounts()}</div>

      {renderResults()}
    </div>
  );
}
