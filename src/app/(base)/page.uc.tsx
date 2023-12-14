"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import * as API from "@/../api";
import styles from "@/lib/styles/Page.module.scss";

type Result = {
  id: number;
  content: string;
  selected: boolean;
};

export default function SearchClient() {
  const searchParams = useSearchParams();

  const searchedPage = searchParams.get("page");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [result, setResult] = useState<Result[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchedPage) {
      setPage(parseInt(searchedPage));
    }
  }, [searchedPage]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setResult(null);

      try {
        const { result } = await API.search.search(searchQuery, page);

        setResult(result);
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
  }, [searchQuery, page]);

  const handleChangeSearchQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatText = (text: string) => {
    const formattedText = text.replace(/<<(.*?)>>/g, "<code>$1</code>");
    const boldifiedText = formattedText.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    return { __html: boldifiedText };
  };

  const handleChangePage = (selectedPage: number) => {
    if (selectedPage !== page) {
      setPage(selectedPage);
    }
  };

  const renderOrders = () => {
    return result?.map((item, idx) => (
      <span
        key={idx}
        onClick={() => handleChangePage(item.id)}
        className={
          item.id === page ? `${styles.count} ${styles.selected}` : styles.count
        }>
        {item.id}
      </span>
    ));
  };

  const renderResults = () => {
    if (isLoading) return <span className={styles.load}>Loading...</span>;
    if (error) return <span className={styles.error}>{error}</span>;

    return (
      <div className={styles.content_wrapper}>
        {result &&
          result.map((item, idx) => {
            return (
              item.selected && (
                <div key={idx} className={styles.content}>
                  <span dangerouslySetInnerHTML={formatText(item.content)} />
                </div>
              )
            );
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

      <div className={styles.counts_wrapper}>{renderOrders()}</div>

      <span className={styles.count}>
        {result?.length === 0
          ? "Nothing found"
          : `Search result: ${result?.length}`}
      </span>

      {renderResults()}
    </div>
  );
}
