import PostsPage from '../../pages/posts';
import * as assert from 'assert';
import utils from '../../utils';
import { } from 'mocha';
import Agent from '../../utils/agent';

import ControllerFactory from '../../../../../lib/core/controller-factory';
import { IPost } from 'modepress';
import { PostsController } from '../../../../../lib/controllers/posts';

let postPage = new PostsPage();
let admin: Agent, joe: Agent;
let post: IPost;
let controller: PostsController;

describe( '1. View post created by backend', function() {

  before( async () => {
    controller = ControllerFactory.get( 'posts' );
    admin = await utils.refreshAdminToken();
    joe = await utils.createAgent( 'Joe', 'joe222@test.com', 'password' );

    try {
      post = await controller.getPost( { slug: 'test-post' } );
      if ( post )
        await controller.removePost( post._id.toString() );
    }
    catch { }

    post = await controller.create( {
      title: 'Test Post',
      slug: 'test-post',
      public: false,
      content: 'This is a post\'s content'
    } )

    await postPage.load( admin );
    assert( await postPage.$( '.mt-posts' ) );
  } )

  it( 'Post is available in post dashboard & visible to admin', async () => {
    const posts = await postPage.getPosts();
    assert( posts.length > 0 );
    assert.equal( posts[ 0 ].name, 'Test Post' );
    assert.equal( posts[ 0 ].image, '/images/avatar-1.svg' );
    assert.equal( posts[ 0 ].content, 'This is a post\'s content' );
  } )

  it( 'Post is private & not visible to regular user in dashboard', async () => {
    await postPage.load( joe );
    const posts = await postPage.getPosts();
    if ( posts.length > 0 )
      assert.notEqual( posts[ 0 ].name, 'Test Post' );
  } )

  after( async () => {
    if ( post )
      await controller.removePost( post._id.toString() );
  } )
} );