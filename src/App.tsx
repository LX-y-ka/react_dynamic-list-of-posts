import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import { PostsList } from './components/PostsList';
import { UserSelector } from './components/UserSelector';
import { Loader } from './components/Loader';
import { useEffect, useRef, useState } from 'react';
import { User } from './types/User';
import { Post } from './types/Post';
import { client } from './utils/fetchClient';
import cn from 'classnames';
import { PostDetails } from './components/PostDetails';

export const App = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const hasStartedLoading = useRef(false);
  const isNoPostError =
    selectedUser !== null &&
    !loading &&
    posts.length === 0 &&
    !error &&
    !hasStartedLoading.current;

  useEffect(() => {
    setSelectedPost(null);
    if (selectedUser !== null) {
      setPosts([]);
      setLoading(true);
      hasStartedLoading.current = true;

      client
        .get<Post[]>(`/posts?userId=${selectedUser.id}`)
        .then(result => setPosts(result))
        .catch(() => setError(true))
        .finally(() => {
          setLoading(false);
          hasStartedLoading.current = false;
        });
    }
  }, [selectedUser]);

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                <UserSelector
                  onSelect={setSelectedUser}
                  selectedUser={selectedUser}
                />
              </div>

              <div className="block" data-cy="MainContent">
                {selectedUser === null && (
                  <p data-cy="NoSelectedUser">No user selected</p>
                )}

                {loading && <Loader />}

                {error && (
                  <div
                    className="notification is-danger"
                    data-cy="PostsLoadingError"
                  >
                    Something went wrong!
                  </div>
                )}

                {isNoPostError ? (
                  <div className="notification is-warning" data-cy="NoPostsYet">
                    No posts yet
                  </div>
                ) : (
                  posts.length > 0 &&
                  !loading && (
                    <PostsList
                      onSelect={setSelectedPost}
                      posts={posts}
                      selectedPost={selectedPost}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={cn('tile', 'is-parent', 'is-8-desktop', 'Sidebar', {
              'Sidebar--open': selectedPost !== null,
            })}
          >
            <div className="tile is-child box is-success ">
              {selectedPost !== null && <PostDetails post={selectedPost} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
