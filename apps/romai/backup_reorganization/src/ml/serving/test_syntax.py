def test_syntax():
    question = "test"
    if True:
        pass
    elif ("romanian" in question or "romania" in question or "cultura" in question or "traditional" in question or "cultural" in question or "history" in question or "heritage" in question):
        print("match")
    else:
        print("no match")

test_syntax()