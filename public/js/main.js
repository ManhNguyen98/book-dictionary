$(function () {
  $(document).on(
    {
      mouseleave: function () {
        $(this).find('.far').removeClass('star-over');
        $(this).prevAll().find('.far').removeClass('star-over');
      },
    },
    '.rate',
  );

  $(document).on('click', '#formAddBook .rate', function () {
    if (!$(this).find('.star').hasClass('.rate-active')) {
      $(this)
        .siblings()
        .find('.star')
        .addClass('far')
        .removeClass('fas rate-active');
      $(this)
        .find('.star')
        .addClass('rate-active fas')
        .removeClass('far star-over');
      $(this)
        .prevAll()
        .find('.star')
        .addClass('fas')
        .removeClass('far star-over');
    }
  });
});
function addBook(newBook) {
  $.ajax({
    type: 'POST',
    url: '/books',
    data: newBook,
    dataType: 'json',
    success: function (data) {
      if (data) {
        window.location.href = '/books';
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}

function removeBook(bookId) {
  $.ajax({
    type: 'DELETE',
    url: `/books/${bookId}`,
    success: function () {
      window.location.href = '/books';
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}

function editMetatdata(id, newBook) {
  $.ajax({
    type: 'PUT',
    url: `/books/${id}`,
    data: newBook,
    dataType: 'json',
    success: function (data) {
      if (data) {
        window.location.reload();
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}

function createNote(payload) {
  $.ajax({
    type: 'POST',
    url: '/notes',
    data: payload,
    dataType: 'json',
    success: function (data) {
      if (data) {
        window.location.reload();
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}

function removeNote(id) {
  $.ajax({
    type: 'DELETE',
    url: `/notes/${id}`,
    success: function () {
      window.location.reload();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}

function logout() {
  $.ajax({
    type: 'POST',
    url: '/auth/logout',
    success: function () {
      window.location.href = '/login';
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    },
  });
}

$(document).ready(function () {
  $('#btnAddBook').click(function () {
    let values = {};
    $.each($('#formAddBook').serializeArray(), function (i, field) {
      values[field.name] = field.value;
    });
    const rating = $('.fa-star.star.fas').length;
    values.rating = rating;
    addBook(values);
  });
  $('#btnRemoveBook').click(function () {
    const url = window.location.href;
    const splitted = url.split('/');
    const bookId = splitted.pop();
    removeBook(bookId);
  });
  $('#btnEditMeta').click(function () {
    const url = window.location.href;
    const splitted = url.split('/');
    const bookId = splitted.pop();
    let values = {};
    $.each($('#formEditMeta').serializeArray(), function (i, field) {
      values[field.name] = field.value;
    });
    const rating = $('.fa-star.star.fas').length;
    values.rating = rating;
    editMetatdata(bookId, values);
  });
  $('#btnMarkup').click(function () {
    const url = window.location.href;
    const splitted = url.split('/');
    const bookId = splitted.pop();
    let values = {};
    $.each($('#formMarkup').serializeArray(), function (i, field) {
      values[field.name] = field.value;
    });
    createNote({
      ...values,
      book_id: bookId,
      is_read: $('#markAsReadCheck').is(':checked') ? 1 : 0,
    });
  });
  $('.btn-delete-note').click(function () {
    const id = $(this).attr('data-id');
    removeNote(id);
  });
  $('#btnLogout').click(function () {
    logout();
  });
});
