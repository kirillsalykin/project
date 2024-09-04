use async_graphql::Object;

pub struct DummyQuery;

#[Object]
impl DummyQuery {
    async fn add(&self, a: i32, b: i32) -> i32 {
        a + b
    }
}

pub struct DummyMutation;

#[Object]
impl DummyMutation {
    // Returns the sum of a and b
    async fn add(&self, a: i32, b: i32) -> i32 {
        a + b
    }
}
