import React from "react";

import Container from "react-bootstrap/Container";

import Breeds from "../helpers/getBreeds";

import Cats from "../helpers/getCats";

const breeds: Breed[] = await Breeds();

export default function App() {
  const [cats, setCats] = React.useState<Cat[]>();

  const [catIds, setCatIds] = React.useState<string[]>();

  const [page, setPage] = React.useState<number>(1);

  const [breed, setBreed] = React.useState<string>();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const [isReachedMaxCats, setIsReachedMaxCats] =
    React.useState<boolean>(false);

  const loadCats = async () => {
    let newCatsResult: Cat[] = await Cats({
      breedID: breed,
      page,
    });

    let tempCats: Cat[] = [];
    const ids: string[] = [];

    // Initial cats
    if (!cats) {
      tempCats = structuredClone(newCatsResult);
    }

    // Push new cats
    if (cats && catIds) {
      tempCats = structuredClone(cats);

      // Filter existing cats
      const newCats = newCatsResult.filter(
        (cat: Cat) => !catIds.includes(cat.id)
      );

      if (newCats.length) {
        tempCats.push(...newCats.values());
      }

      if (!newCats.length) {
        // Hide "Load more" button
        setIsReachedMaxCats(true);
      }
    }

    // Get cats' ids
    tempCats.map((cat) => {
      ids.push(cat.id);
    });

    setCatIds(ids);
    setCats(tempCats);
    setIsLoading(false);
  };

  const clearPreviousCats = () => {
    setPage(1);
    setCats([]);
    setCatIds([]);
    setIsReachedMaxCats(false);
    return true;
  };

  React.useEffect(() => {
    if (page && breed) {
      loadCats();
    }
  }, [breed, page]);

  return (
    <>
      <h1>Cat Browser</h1>
      <div className="row" style={{ padding: "10px 0px" }}>
        <div className="col-md-3 col-sm-6 col-12">
          <div className="form-group">
            <label className="form-label" htmlFor="breed">
              Breed
            </label>
            <select
              id="breed"
              className="form-control"
              onChange={(e) => {
                if (clearPreviousCats()) {
                  const selectedBreed = e.target.value;
                  setIsLoading(true);
                  setBreed(selectedBreed);
                }
              }}
            >
              <option value="">Select breed</option>
              {breeds?.map((row, i, array) => {
                return (
                  <option key={i} value={row.id}>
                    {row.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        {cats?.map((row, i: number, array: object[]) => {
          return (
            <div key={row.id} className="col-md-3 col-sm-6 col-12">
              <div className="card">
                <img className="card-img-top" src={row.url} />
                <div className="card-body">
                  <a className="btn btn-primary btn-block" href={`/${row.id}`}>
                    View details
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {!cats && (
          <div className="col-12" style={{ marginBottom: "20px" }}>
            No cats available
          </div>
        )}
      </div>
      {!isReachedMaxCats && (
        <div className="row">
          <div className="col-md-3 col-sm-6 col-12">
            <button
              disabled={(() => {
                if (!cats) return true;
                if (isLoading) return true;

                return false;
              })()}
              type="button"
              className="btn btn-success"
              onClick={() => {
                setIsLoading(true);
                setPage(page + 1);
              }}
            >
              {isLoading ? "Loading cats..." : "Load more"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
